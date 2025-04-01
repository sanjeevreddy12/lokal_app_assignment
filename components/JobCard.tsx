import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { Job } from '../types';

interface JobCardProps {
    job: Job;
    onPress: (job: Job) => void;
    showBookmarkButton?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress, showBookmarkButton = true }) => {
    const { isBookmarked, addBookmark, removeBookmark } = useDatabase();
    const bookmarked = isBookmarked(job.id);

    const handleBookmarkPress = () => {
        if (bookmarked) {
            removeBookmark(job.id);
        } else {
            addBookmark(job);
        }
    };


    const formattedSalary = job.salary?.startsWith('₹')
        ? job.salary
        : job.salary ? `₹${job.salary}` : 'Not specified';

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(job)}>
            <View style={styles.cardContent}>
                <Text style={styles.title}>{job.title}</Text>
                <View style={styles.companyContainer}>
                    <Ionicons name="business-outline" size={16} color="#666" />
                    <Text style={styles.company}>{job.company}</Text>
                </View>

                <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.location}>{job.location}</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                        <Ionicons name="cash-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{formattedSalary}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="briefcase-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{job.jobType || 'Not specified'}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{job.phone || 'Not available'}</Text>
                    </View>
                </View>
            </View>

            {showBookmarkButton && (
                <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={handleBookmarkPress}
                >
                    <Ionicons
                        name={bookmarked ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={bookmarked ? "#4a80f5" : "#666"}
                    />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
    },
    cardContent: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    companyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    company: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    location: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    detailsContainer: {
        marginTop: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    bookmarkButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
    },
});

export default JobCard;