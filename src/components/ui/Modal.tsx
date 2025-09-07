import React from 'react';
import { Modal as RNModal, View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  overlayStyle?: ViewStyle;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  style,
  overlayStyle,
  animationType = 'slide',
  transparent = true,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.overlay, overlayStyle]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[styles.content, style]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: '90%',
    maxHeight: '80%',
  },
});
