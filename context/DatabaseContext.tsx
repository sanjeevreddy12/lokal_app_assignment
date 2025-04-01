import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SQLiteModule from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job } from '../types';

const getDatabase = () => {
    if (Platform.OS === 'web') {
        return null;
    }

    //@ts-ignore
    return SQLiteModule.openDatabase('jobs.db');
};

interface DatabaseContextType {
    bookmarks: Job[];
    addBookmark: (job: Job) => void;
    removeBookmark: (jobId: string) => void;
    isBookmarked: (jobId: string) => boolean;
    loading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
    bookmarks: [],
    addBookmark: () => { },
    removeBookmark: () => { },
    isBookmarked: () => false,
    loading: true,
});

export const useDatabase = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
    children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
    const [db, setDb] = useState<any>(null);
    const [bookmarks, setBookmarks] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            if (Platform.OS === 'web') {

                try {
                    const savedBookmarks = localStorage.getItem('bookmarks');
                    if (savedBookmarks) {
                        setBookmarks(JSON.parse(savedBookmarks));
                    }
                } catch (error) {
                    console.error('Error loading bookmarks from localStorage:', error);
                }
                setLoading(false);
            } else {

                try {
                    const database = getDatabase();
                    setDb(database);

                    database.transaction(
                        (tx: any) => {
                            tx.executeSql(
                                'CREATE TABLE IF NOT EXISTS bookmarks (id TEXT PRIMARY KEY, jobData TEXT)',
                                [],
                                () => {
                                    loadBookmarks(database);
                                },
                                (_: any, error: any) => {
                                    console.error('Error creating table:', error);
                                    setLoading(false);
                                    return false;
                                }
                            );
                        },
                        (error: any) => {
                            console.error('Transaction error:', error);
                            setLoading(false);
                        }
                    );
                } catch (error) {
                    console.error('Database initialization error:', error);
                    setLoading(false);


                    try {
                        const savedBookmarks = await AsyncStorage.getItem('bookmarks');
                        if (savedBookmarks) {
                            setBookmarks(JSON.parse(savedBookmarks));
                        }
                    } catch (asyncError) {
                        console.error('AsyncStorage fallback error:', asyncError);
                    }
                }
            }
        };

        initializeData();
    }, []);

    const loadBookmarks = (database: any) => {
        database.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM bookmarks',
                [],
                (_: any, { rows }: any) => {
                    const bookmarksData = rows._array.map((item: any) => JSON.parse(item.jobData));
                    setBookmarks(bookmarksData);
                    setLoading(false);
                },
                (_: any, error: any) => {
                    console.error('Error loading bookmarks:', error);
                    setLoading(false);
                    return false;
                }
            );
        });
    };

    const addBookmark = async (job: Job) => {
        if (Platform.OS === 'web') {

            const updatedBookmarks = [...bookmarks.filter(b => b.id !== job.id), job];
            setBookmarks(updatedBookmarks);
            try {
                localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        } else if (db) {

            try {
                db.transaction((tx: any) => {
                    tx.executeSql(
                        'INSERT OR REPLACE INTO bookmarks (id, jobData) VALUES (?, ?)',
                        [job.id, JSON.stringify(job)],
                        () => {
                            setBookmarks(prev => [...prev.filter(b => b.id !== job.id), job]);
                        },
                        (_: any, error: any) => {
                            console.error('Error adding bookmark:', error);
                            return false;
                        }
                    );
                });
            } catch (error) {
                console.error('SQLite transaction error, falling back to AsyncStorage:', error);

                // Fallback to AsyncStorage
                const updatedBookmarks = [...bookmarks.filter(b => b.id !== job.id), job];
                setBookmarks(updatedBookmarks);
                try {
                    await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
                } catch (asyncError) {
                    console.error('Error saving to AsyncStorage:', asyncError);
                }
            }
        } else {

            const updatedBookmarks = [...bookmarks.filter(b => b.id !== job.id), job];
            setBookmarks(updatedBookmarks);
            try {
                await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
            } catch (asyncError) {
                console.error('Error saving to AsyncStorage:', asyncError);
            }
        }
    };

    const removeBookmark = async (jobId: string) => {
        if (Platform.OS === 'web') {

            const updatedBookmarks = bookmarks.filter(job => job.id !== jobId);
            setBookmarks(updatedBookmarks);
            try {
                localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        } else if (db) {
            // For native, use SQLite
            try {
                db.transaction((tx: any) => {
                    tx.executeSql(
                        'DELETE FROM bookmarks WHERE id = ?',
                        [jobId],
                        () => {
                            setBookmarks(prev => prev.filter(job => job.id !== jobId));
                        },
                        (_: any, error: any) => {
                            console.error('Error removing bookmark:', error);
                            return false;
                        }
                    );
                });
            } catch (error) {
                console.error('SQLite transaction error, falling back to AsyncStorage:', error);

                // Fallback to AsyncStorage
                const updatedBookmarks = bookmarks.filter(job => job.id !== jobId);
                setBookmarks(updatedBookmarks);
                try {
                    await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
                } catch (asyncError) {
                    console.error('Error saving to AsyncStorage:', asyncError);
                }
            }
        } else {

            const updatedBookmarks = bookmarks.filter(job => job.id !== jobId);
            setBookmarks(updatedBookmarks);
            try {
                await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
            } catch (asyncError) {
                console.error('Error saving to AsyncStorage:', asyncError);
            }
        }
    };

    const isBookmarked = (jobId: string) => {
        return bookmarks.some(job => job.id === jobId);
    };

    return (
        <DatabaseContext.Provider
            value={{
                bookmarks,
                addBookmark,
                removeBookmark,
                isBookmarked,
                loading,
            }}
        >
            {children}
        </DatabaseContext.Provider>
    );
};