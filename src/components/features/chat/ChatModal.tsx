import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal } from '@/components/ui';
import { useChatStore, useUIStore, useAuthStore } from '@/stores';
import { ChatMessage } from '@/types/chat';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { messages, sendMessage, isLoading: chatLoading, error } = useChatStore();
  const { user } = useAuthStore();

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      setIsLoading(true);
      await sendMessage({
        message: message.trim(),
        user_id: user.id,
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (msg: ChatMessage) => (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text style={styles.messageText}>{msg.content}</Text>
      <Text style={styles.messageTime}>
        {new Date(msg.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} onClose={onClose} style={styles.modal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>AI Assistant</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                Hi! I'm your AI productivity assistant. I can help you:
              </Text>
              <Text style={styles.welcomeBullet}>• Create and organize tasks</Text>
              <Text style={styles.welcomeBullet}>• Plan your focus sessions</Text>
              <Text style={styles.welcomeBullet}>• Provide productivity insights</Text>
              <Text style={styles.welcomeBullet}>• Answer questions about your workflow</Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
          
          {(isLoading || chatLoading) && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me anything about your tasks..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            editable={!isLoading && !chatLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || isLoading || chatLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isLoading || chatLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    maxHeight: '80%',
    width: '90%',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748b',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  welcomeBullet: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    marginLeft: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 12,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#64748b',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
