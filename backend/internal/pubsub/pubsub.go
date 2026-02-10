package pubsub

import (
	"sync"

	"helpmeclean-backend/internal/graph/model"
)

// PubSub is an in-memory topic-based publish/subscribe system for real-time chat.
type PubSub struct {
	mu          sync.RWMutex
	subscribers map[string]map[string]chan *model.ChatMessage
}

// New creates a new PubSub instance.
func New() *PubSub {
	return &PubSub{
		subscribers: make(map[string]map[string]chan *model.ChatMessage),
	}
}

// Subscribe creates a new subscription channel for the given topic and subscriber ID.
func (ps *PubSub) Subscribe(topic, subscriberID string) <-chan *model.ChatMessage {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	if ps.subscribers[topic] == nil {
		ps.subscribers[topic] = make(map[string]chan *model.ChatMessage)
	}

	ch := make(chan *model.ChatMessage, 10)
	ps.subscribers[topic][subscriberID] = ch
	return ch
}

// Unsubscribe removes a subscriber from a topic and closes the channel.
func (ps *PubSub) Unsubscribe(topic, subscriberID string) {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	if subs, ok := ps.subscribers[topic]; ok {
		if ch, ok := subs[subscriberID]; ok {
			close(ch)
			delete(subs, subscriberID)
		}
		if len(subs) == 0 {
			delete(ps.subscribers, topic)
		}
	}
}

// Publish sends a message to all subscribers of the given topic.
func (ps *PubSub) Publish(topic string, msg *model.ChatMessage) {
	ps.mu.RLock()
	defer ps.mu.RUnlock()

	if subs, ok := ps.subscribers[topic]; ok {
		for _, ch := range subs {
			select {
			case ch <- msg:
			default:
				// Drop message if subscriber buffer is full.
			}
		}
	}
}
