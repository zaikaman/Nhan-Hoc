import { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { Pressable, Text } from 'react-native';

// Define props interface
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: ViewStyle;
}

/**
 * Example TypeScript component template
 * Use this as reference for creating new components
 */
export function Button({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  children,
  className = '',
  style
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-accent-blue',
    secondary: 'bg-accent-purple',
    outline: 'border-2 border-accent-blue bg-transparent'
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-6 py-3 rounded-2xl ${variantStyles[variant]} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      style={style}
    >
      {children || (
        <Text className="text-white text-center font-semibold">
          {title}
        </Text>
      )}
    </Pressable>
  );
}

// Export type for reuse
export type { ButtonProps };

