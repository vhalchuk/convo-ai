import { Service } from "@/services/service-interface";
import { chat } from "@/services/chat";

export const services: Service[] = [
    chat,
    // ... other services should be added here
];

export const initializeServices = async () => {
    await Promise.all(services.map((service) => service.initialize?.()))
}

export const cleanupServices = async () => {
    await Promise.all(services.map((service) => service.cleanup?.()))
}