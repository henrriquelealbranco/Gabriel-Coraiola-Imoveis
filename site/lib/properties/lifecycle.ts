import type { PropertyStatus } from "@/lib/properties/types";

export const isPublicProperty = (status: PropertyStatus) => status === "active";
export const canPublishProperty = ({ status, imageCount }: { status: PropertyStatus; imageCount: number }) => status === "active" && imageCount > 0;
