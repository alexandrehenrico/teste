import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [userName, setUserName] = useState('Usuário Finagro');
  const [profileImage, setProfileImage] = useState(
    'https://cdn-icons-png.flaticon.com/256/847/847969.png'
  );

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        const storedImage = await AsyncStorage.getItem('profileImage');

        if (storedName) setUserName(storedName);
        if (storedImage) setProfileImage(storedImage);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    loadProfileData();
  }, []);

  const updateProfile = async (newUserName, newProfileImage) => {
    try {
      if (newUserName) {
        await AsyncStorage.setItem('userName', newUserName);
        setUserName(newUserName);
      }
      if (newProfileImage) {
        await AsyncStorage.setItem('profileImage', newProfileImage);
        setProfileImage(newProfileImage);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  return (
    <ProfileContext.Provider value={{ userName, profileImage, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
