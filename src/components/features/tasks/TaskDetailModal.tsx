import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Task } from '@/types/tasks';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: string, updates: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onComplete: (taskId: string) => Promise<void>;
}

export default function TaskDetailModal({
  visible,
  task,
  onClose,
  onUpdate,
  onDelete,
  onComplete,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPriority, setEditedPriority] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditedPriority(task.priority);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    
    setIsLoading(true);
    try {
      await onUpdate(task.id, {
        title: editedTitle.trim(),
        description: editedDescription.trim() || undefined,
        priority: editedPriority,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditedPriority(task.priority);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!task) return;
    
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(task.id);
              onClose();
            } catch (error) {
              console.error('Failed to delete task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    if (!task) return;
    
    try {
      await onComplete(task.id);
      onClose();
    } catch (error) {
      console.error('Failed to complete task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#dc2626';
      case 2: return '#d1d5db';
      case 3: return '#d1d5db';
      default: return '#d1d5db';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'High Priority';
      case 2: return 'Medium Priority';
      case 3: return 'Low Priority';
      default: return 'No Priority';
    }
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.projectText}>Inbox</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Text style={styles.headerButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Task Title */}
          <View style={styles.titleSection}>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
            {isEditing ? (
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Task title"
                multiline
              />
            ) : (
              <Text style={styles.titleText}>{task.title}</Text>
            )}
          </View>

          {/* Task Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>Description</Text>
            {isEditing ? (
              <TextInput
                style={styles.descriptionInput}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Add a description..."
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.descriptionText}>
                {task.description || 'No description added'}
              </Text>
            )}
          </View>

          {/* Task Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority</Text>
              {isEditing ? (
                <View style={styles.prioritySelector}>
                  {[1, 2, 3].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        { backgroundColor: getPriorityColor(priority) },
                        editedPriority === priority && styles.selectedPriority,
                      ]}
                      onPress={() => setEditedPriority(priority)}
                    >
                      <Text style={styles.priorityOptionText}>{priority}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.priorityTagText}>
                    {getPriorityLabel(task.priority)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={[styles.statusTag, { backgroundColor: '#10b981' }]}>
                <Text style={styles.statusTagText}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Text>
              </View>
            </View>

            {task.tags && task.tags.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {task.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {new Date(task.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={isLoading || !editedTitle.trim()}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.viewActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              {task.status !== 'completed' && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleComplete}
                >
                  <Text style={styles.completeButtonText}>Complete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  priorityIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
    marginTop: 2,
  },
  titleText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 32,
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 32,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  descriptionSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
  },
  detailsSection: {
    paddingVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  selectedPriority: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  priorityOptionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  priorityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
