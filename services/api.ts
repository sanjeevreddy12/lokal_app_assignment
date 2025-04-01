import axios from "axios";


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

const BASE_URL = "https://testapi.getlokalapp.com";


export const fetchJobs = async (page = 1): Promise<Job[]> => {
    try {
        console.log("Fetching jobs for page:", page);
        const response = await axios.get(`${BASE_URL}/common/jobs?page=${page}`);
        console.log("API response:", response.data);

        if (response.data && response.data.results) {
            return response.data.results.map((job: any): Job => ({
                id: job.id,
                title: job.title || "Untitled Position",
                company: job.company_name || "Company Not Listed",
                location:
                    job.primary_details?.Place ||
                    job.job_location_slug ||
                    "Location Not Specified",
                salary:
                    job.primary_details?.Salary ||
                    `₹${job.salary_min} - ₹${job.salary_max}` ||
                    "Not specified",
                phone:
                    job.whatsapp_no ||
                    job.custom_link?.replace("tel:", "") ||
                    "Contact Not Available",
                description: job.other_details || "",
                requirements: job.primary_details?.Qualification || "Not specified",
                experience: job.primary_details?.Experience || "Not specified",
                jobType:
                    job.primary_details?.Job_Type || job.job_hours || "Not specified",
                openings: job.openings_count || "Not specified",
                jobRole: job.job_role || "Not specified",
                jobCategory: job.job_category || "Not specified",
                createdOn: job.created_on || "",
                updatedOn: job.updated_on || "",
                expiresOn: job.expire_on || "",
                fees: job.fees_text || job.primary_details?.Fees_Charged || "No fees",
                companyDetails: {
                    name: job.company_name || "Not specified",
                    contactPreference: job.contact_preference || {},
                    whatsappLink: job.contact_preference?.whatsapp_link || "",
                    callStartTime:
                        job.contact_preference?.preferred_call_start_time || "",
                    callEndTime: job.contact_preference?.preferred_call_end_time || "",
                    buttonText: job.button_text || "",
                },
                additionalInfo: {
                    views: job.views || 0,
                    shares: job.shares || 0,
                    fbShares: job.fb_shares || 0,
                    applications: job.num_applications || 0,
                    isPremium: job.is_premium || false,
                    tags:
                        job.job_tags?.map((tag: any) => ({
                            value: tag.value,
                            bgColor: tag.bg_color,
                            textColor: tag.text_color,
                        })) || [],
                    contentV3:
                        job.contentV3?.V3?.reduce((acc: Record<string, { name: string; value: string }>, item: any) => {
                            acc[item.field_key] = {
                                name: item.field_name,
                                value: item.field_value,
                            };
                            return acc;
                        }, {}) || {},
                },
                media: {
                    images:
                        job.creatives?.map((creative: any) => ({
                            url: creative.file,
                            thumbnail: creative.thumb_url,
                        })) || [],
                    videos: job.videos || [],
                },
            }));
        }

        console.error("Invalid API response format");
        return [];
    } catch (error: any) {
        console.error("API Error:", error.message);
        if (error.response) {
            console.error("Error response:", error.response.data);
            console.error("Error status:", error.response.status);
        }
        throw new Error("Failed to fetch jobs");
    }
};
