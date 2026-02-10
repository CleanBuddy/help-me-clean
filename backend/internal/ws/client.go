package ws

import "github.com/gorilla/websocket"

// Client represents a WebSocket connection.
type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}
