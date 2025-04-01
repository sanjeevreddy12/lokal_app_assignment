import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../../../context/DatabaseContext';
import { Job } from '../../../types';

export const unstable_settings = {
    initialRouteName: "index",
};

export default function JobDetailScreen() {
    const params = useLocalSearchParams();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isBookmarked, addBookmark, removeBookmark } = useDatabase();

    useEffect(() => {
        try {

            if (params.job) {
                const jobData = JSON.parse(params.job as string) as Job;
                setJob(jobData);
            } else {
                setError("Job data not found");
            }
        } catch (err) {
            console.error("Error parsing job data:", err);
            setError("Failed to load job details");
        } finally {
            setLoading(false);
        }
    }, [params.job]);

    const handleBookmarkToggle = () => {
        if (!job) return;

        if (isBookmarked(job.id)) {
            removeBookmark(job.id);
        } else {
            addBookmark(job);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a80f5" />
                <Text style={styles.loadingText}>Loading job details...</Text>
            </View>
        );
    }

    if (error || !job) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
                <Text style={styles.errorText}>{error || "Job not found"}</Text>
            </View>
        );
    }

    const bookmarked = isBookmarked(job.id);

    return (
        <>
            <Stack.Screen options={{ title: "Job Detail" }} />
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{job.title}</Text>
                        <TouchableOpacity onPress={handleBookmarkToggle}>
                            <Ionicons
                                name={bookmarked ? "bookmark" : "bookmark-outline"}
                                size={28}
                                color={bookmarked ? "#4a80f5" : "#666"}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.companyContainer}>
                        <Text style={styles.companyName}>{job.company || 'Company not specified'}</Text>
                    </View>


                    {job.additionalInfo?.tags && job.additionalInfo.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {job.additionalInfo.tags.map((tag, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.tag,
                                        {
                                            backgroundColor: tag.bgColor || '#e1f5fe',
                                        }
                                    ]}
                                >
                                    <Text style={[styles.tagText, { color: tag.textColor || '#0277bd' }]}>{tag.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>


                <View style={styles.card}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <Text style={styles.detailText}>{job.location}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Ionicons name="cash-outline" size={20} color="#666" />
                            <Text style={styles.detailText}>{job.salary}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="briefcase-outline" size={20} color="#666" />
                            <Text style={styles.detailText}>{job.jobType || 'Not specified'}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Ionicons name="people-outline" size={20} color="#666" />
                            <Text style={styles.detailText}>Openings: {job.openings || 'Not specified'}</Text>
                        </View>
                    </View>
                </View>


                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Job Category & Role</Text>
                    <View style={styles.detailItem}>
                        <Ionicons name="list-outline" size={20} color="#666" />
                        <Text style={styles.detailText}>Category: {job.jobCategory || 'Not specified'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="person-outline" size={20} color="#666" />
                        <Text style={styles.detailText}>Role: {job.jobRole || 'Not specified'}</Text>
                    </View>
                </View>


                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Qualifications</Text>
                    <View style={styles.detailItem}>
                        <Ionicons name="school-outline" size={20} color="#666" />
                        <Text style={styles.detailText}>Education: {job.requirements || 'Not specified'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="trending-up-outline" size={20} color="#666" />
                        <Text style={styles.detailText}>Experience: {job.experience || 'Not specified'}</Text>
                    </View>
                </View>


                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Job Description</Text>
                    <Text style={styles.description}>{job.description || 'No description available'}</Text>
                </View>


                {(job.createdOn || job.expiresOn) && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Application Timeline</Text>
                        {job.createdOn && (
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.detailText}>Posted on: {new Date(job.createdOn).toLocaleDateString()}</Text>
                            </View>
                        )}
                        {job.expiresOn && (
                            <View style={styles.detailItem}>
                                <Ionicons name="hourglass-outline" size={20} color="#666" />
                                <Text style={styles.detailText}>Expires on: {new Date(job.expiresOn).toLocaleDateString()}</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={20} color="#666" />
                        <Text style={styles.detailText}>{job.phone || 'Not available'}</Text>
                    </View>
                    {job.companyDetails?.whatsappLink && (
                        <View style={styles.detailItem}>
                            <Ionicons name="logo-whatsapp" size={20} color="#666" />
                            <Text style={styles.detailText}>WhatsApp Available</Text>
                        </View>
                    )}
                </View>


                {job.additionalInfo?.applications !== undefined && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Application Statistics</Text>
                        <View style={styles.detailItem}>
                            <Ionicons name="stats-chart-outline" size={20} color="#666" />
                            <Text style={styles.detailText}>Applications received: {job.additionalInfo.applications}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="eye-outline" size={20} color="#666" />
                            <Text style={styles.detailText}>Views: {job.additionalInfo.views}</Text>
                        </View>
                    </View>
                )}


                {job.fees && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Fees Information</Text>
                        <View style={styles.detailItem}>
                            <Ionicons name="wallet-outline" size={20} color="#666" />
                            <Text style={styles.detailText}>{job.fees}</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#f44336',
        textAlign: 'center',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    companyContainer: {
        marginTop: 8,
    },
    companyName: {
        fontSize: 16,
        color: '#666',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    tag: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        lineHeight: 22,
    },
});