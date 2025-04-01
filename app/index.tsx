import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import JobCard from '../components/JobCard';
import { fetchJobs } from '@/services/api';
import { Job } from '../types';

export default function JobsScreen() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();

    const loadJobs = async (pageNum: number, shouldRefresh = false) => {
        if (loading) return;

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching page:', pageNum);
            const jobsData = await fetchJobs(pageNum);
            console.log('API response inside index:', jobsData);

            if (jobsData && jobsData.length > 0) {
                if (shouldRefresh) {
                    setJobs(jobsData);
                } else {
                    setJobs(prev => [...prev, ...jobsData]);
                }
                setHasMore(jobsData.length > 0);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            setError((err as Error).message);
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        loadJobs(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadJobs(nextPage);
        }
    };

    useEffect(() => {
        loadJobs(page);
    }, []);

    const renderFooter = () => {
        if (!loading) return null;

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#4a80f5" />
            </View>
        );
    };

    const navigateToJobDetail = (job: Job) => {
        router.push({
            pathname: '/stack/job/[id]',
            params: { id: job.id, job: JSON.stringify(job) }
        });
    };

    console.log("Jobs data:", jobs);

    if (error && jobs.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <Text style={styles.retryText} onPress={handleRefresh}>
                    Tap to retry
                </Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: "Jobs" }} />
            <View style={styles.container}>
                <FlatList
                    data={jobs}
                    renderItem={({ item }) => (
                        <JobCard job={item} onPress={() => navigateToJobDetail(item)} />
                    )}
                    keyExtractor={item => item?.id ? item.id.toString() : `job-${Math.random()}`}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    //@ts-ignore
                    ListEmptyComponent={
                        !loading && jobs.length === 0 && (
                            <View style={styles.centered}>
                                <Text style={styles.emptyText}>No jobs available</Text>
                            </View>
                        )
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#4a80f5']}
                        />
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
    footer: {
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 8,
    },
    retryText: {
        fontSize: 16,
        color: '#4a80f5',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});