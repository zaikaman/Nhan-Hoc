import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../constants/theme';

interface AppHeaderProps {
  title?: string;
  showMenuButton?: boolean;
}

export default function AppHeader({ title = 'Nhàn Học', showMenuButton = true }: AppHeaderProps) {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View 
      className="flex-row items-center justify-between px-6 py-4"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* {showMenuButton && (
        <TouchableOpacity 
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#F8FAFC' }}
          onPress={() => navigation.openDrawer()}
        >
          <Feather name="menu" size={24} color={colors.primary} />
        </TouchableOpacity>
      )} */}
      
      <Text 
        className="text-2xl font-bold flex-1 ml-0"
        style={{ color: colors.primary }}
      >
        {title}
      </Text>
    </View>
  );
}
