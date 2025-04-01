import React from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import JobCard from '../components/JobCard';
import { useDatabase } from '../context/DatabaseContext';
import { Job } from '../types';

export default function BookmarksScreen() {
    const { bookmarks, loading } = useDatabase();
    const router = useRouter();

    const navigateToJobDetail = (job: Job) => {
        router.push({
            pathname: '/stack/job/[id]',
            params: { id: job.id, job: JSON.stringify(job) }
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4a80f5" />
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: "Bookmarks" }} />
            <View style={styles.container}>
                <FlatList
                    data={bookmarks}
                    renderItem={({ item }) => (
                        <JobCard job={item} onPress={() => navigateToJobDetail(item)} />
                    )}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>No bookmarked jobs</Text>
                            <Text style={styles.instructionText}>
                                Bookmark jobs from the Jobs tab to see them here
                            </Text>
                        </View>
                    }
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
});