export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    phone: string;
    description: string;
    requirements: string;
    experience: string;
    jobType: string;
    openings: string;
    jobRole: string;
    jobCategory: string;
    createdOn: string;
    updatedOn: string;
    expiresOn: string;
    fees: string;
    companyDetails: {
        name: string;
        contactPreference: Record<string, any>;
        whatsappLink: string;
        callStartTime: string;
        callEndTime: string;
        buttonText: string;
    };
    additionalInfo: {
        views: number;
        shares: number;
        fbShares: number;
        applications: number;
        isPremium: boolean;
        tags: Array<{
            value: string;
            bgColor?: string;
            textColor?: string;
        }>;
        contentV3: Record<string, { name: string; value: string }>;
    };
    media: Media;
}

interface Media {
    images: Array<{ url: string; thumbnail: string }>;
    videos: string[];
}