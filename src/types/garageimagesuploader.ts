export interface ImageItem {
    id: string
    file: File
    previewUrl: string
    isUploading?: boolean
}

export interface GaragePostFormData {
    title: string
    caption: string
    externalUrl: string
    makingOf: string
}

export interface UploadResult {
    success: boolean
    message: string
    data?: any
}
