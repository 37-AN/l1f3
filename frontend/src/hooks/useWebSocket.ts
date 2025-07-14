import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import logger from '../utils/logger'
import { initializeAuth } from '../auth/mockAuth'

interface WebSocketState {
  isConnected: boolean
  socket: Socket | null
  lastEvent: any
  connectionTime: number
}

export function useWebSocket(url: string) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    socket: null,
    lastEvent: null,
    connectionTime: 0
  })
  
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const connectionStartTime = useRef<number>(0)

  useEffect(() => {
    // Initialize authentication before connecting
    initializeAuth()
    
    const connectWebSocket = () => {
      connectionStartTime.current = Date.now()
      
      const socket = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
        auth: {
          token: localStorage.getItem('authToken') // JWT token for authentication
        }
      })

      socket.on('connect', () => {
        const connectionTime = Date.now() - connectionStartTime.current
        logger.logWebSocketEvent('connected', { connectionTime })
        logger.logPerformance('WEBSOCKET_CONNECTION', connectionTime, 'ms', 'useWebSocket')
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          socket,
          connectionTime
        }))

        // Subscribe to financial updates
        socket.emit('subscribe_financial_updates', {
          types: ['balance_update', 'transaction_added', 'goal_progress', 'business_revenue', 'milestone_achieved']
        })
      })

      socket.on('disconnect', (reason) => {
        logger.logWebSocketEvent('disconnected', { reason })
        setState(prev => ({
          ...prev,
          isConnected: false
        }))

        // Attempt to reconnect after 5 seconds
        if (reason === 'io server disconnect') {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, 5000)
        }
      })

      // Handle real-time financial events
      socket.on('balance_update', (data) => {
        logger.logWebSocketEvent('balance_update', data)
        setState(prev => ({
          ...prev,
          lastEvent: { event: 'balance_update', data, timestamp: Date.now() }
        }))
      })

      socket.on('transaction_added', (data) => {
        logger.logWebSocketEvent('transaction_added', data)
        setState(prev => ({
          ...prev,
          lastEvent: { event: 'transaction_added', data, timestamp: Date.now() }
        }))
      })

      socket.on('goal_progress', (data) => {
        logger.logWebSocketEvent('goal_progress', data)
        setState(prev => ({
          ...prev,
          lastEvent: { event: 'goal_progress', data, timestamp: Date.now() }
        }))
      })

      socket.on('business_revenue', (data) => {
        logger.logWebSocketEvent('business_revenue', data)
        setState(prev => ({
          ...prev,
          lastEvent: { event: 'business_revenue', data, timestamp: Date.now() }
        }))
      })

      socket.on('milestone_achieved', (data) => {
        logger.logWebSocketEvent('milestone_achieved', data)
        setState(prev => ({
          ...prev,
          lastEvent: { event: 'milestone_achieved', data, timestamp: Date.now() }
        }))
      })

      socket.on('sync_status', (data) => {
        logger.logWebSocketEvent('sync_status', data)
        setState(prev => ({
          ...prev,
          lastEvent: { event: 'sync_status', data, timestamp: Date.now() }
        }))
      })

      socket.on('connection_success', (data) => {
        logger.logWebSocketEvent('connection_success', data)
      })

      socket.on('connect_error', (error) => {
        logger.logError(new Error(error.message), 'WebSocket', 'CONNECTION_ERROR')
        console.warn('WebSocket connection failed:', error.message, '- falling back to polling')
      })

      socket.on('error', (error) => {
        logger.logError(new Error(error), 'WebSocket', 'CONNECTION_ERROR')
        console.warn('WebSocket error:', error)
      })

      socketRef.current = socket
    }

    connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [url])

  // Heartbeat function to test connection latency
  const ping = async (): Promise<number> => {
    if (!state.socket?.connected) return -1
    
    const startTime = Date.now()
    return new Promise((resolve) => {
      state.socket?.emit('ping')
      state.socket?.once('pong', () => {
        const latency = Date.now() - startTime
        logger.logPerformance('WEBSOCKET_LATENCY', latency, 'ms', 'useWebSocket')
        resolve(latency)
      })
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(-1), 5000)
    })
  }

  // Send custom events
  const emit = (event: string, data?: any) => {
    if (state.socket?.connected) {
      state.socket.emit(event, data)
      logger.logWebSocketEvent(`emit_${event}`, data)
    }
  }

  return {
    isConnected: state.isConnected,
    socket: state.socket,
    lastEvent: state.lastEvent,
    connectionTime: state.connectionTime,
    ping,
    emit
  }
}