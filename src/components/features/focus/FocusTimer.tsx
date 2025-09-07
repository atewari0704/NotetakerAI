import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { useFocusStore } from '@/stores';

interface FocusTimerProps {
  targetDuration: number; // in minutes
  onComplete: () => void;
  onPause: () => void;
  onResume: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  targetDuration,
  onComplete,
  onPause,
  onResume,
}) => {
  const [timeLeft, setTimeLeft] = useState(targetDuration * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { updateElapsedTime } = useFocusStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          const elapsed = targetDuration * 60 - newTime;
          const newProgress = (elapsed / (targetDuration * 60)) * 100;
          
          setProgress(newProgress);
          
          if (newTime <= 0) {
            setIsRunning(false);
            onComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isPaused, targetDuration, onComplete]);

  // Update elapsed time separately to avoid render issues
  useEffect(() => {
    if (isRunning && !isPaused) {
      const elapsed = targetDuration * 60 - timeLeft;
      updateElapsedTime(elapsed);
    }
  }, [timeLeft, isRunning, isPaused, targetDuration, updateElapsedTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
    onPause();
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsRunning(true);
    onResume();
  };

  const getProgressColor = (): string => {
    if (progress < 25) return '#ef4444'; // Red
    if (progress < 50) return '#f59e0b'; // Orange
    if (progress < 75) return '#3b82f6'; // Blue
    return '#10b981'; // Green
  };

  return (
    <View style={styles.container}>
      {/* Progress Ring */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressRing, { borderColor: getProgressColor() }]}>
          <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {isPaused ? (
          <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status */}
      <Text style={styles.statusText}>
        {isPaused ? 'Paused' : isRunning ? 'Focusing...' : 'Complete!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  progressContainer: {
    marginBottom: 60,
  },
  progressRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 18,
    color: '#94a3b8',
  },
  controls: {
    marginBottom: 40,
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  resumeButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
