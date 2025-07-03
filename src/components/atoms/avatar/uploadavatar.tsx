'use client'

import { useState } from 'react'
import { updateAvatar } from '@/components/atoms/avatar/uploadAvatar'
import { toast } from 'react-hot-toast'
import { useAvatarStore } from '@/app/store/avatarStore'
import { getAvatar } from '@/app/actions/getAvatar'
import styles from './uploadavatar.module.scss'
import Icon from '@/components/atoms/icons'
import AvatarImage from '@/components/atoms/avatar/avatar'

const MAX_FILE_SIZE_MB = 2

export default function AvatarUploadInput() {
    const [isUploading, setIsUploading] = useState(false)
    const setAvatarUrl = useAvatarStore((state) => state.setAvatarUrl)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`)
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
            setIsUploading(true)
            const res = await updateAvatar(formData)
            if (res.success) {
                toast.success(res.message || 'Avatar updated successfully')
                const latestAvatarUrl = await getAvatar()
                setAvatarUrl(latestAvatarUrl)
            } else {
                toast.error(res.message || 'Upload failed')
            }
        } catch {
            toast.error('Unexpected error occurred.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div>
            <span className={styles.label}>
                headshot
            </span>
            <div className={styles.avatar}>
                <div className={styles.icon}>
                    <Icon name='upload' size={32} />
                </div>
                <AvatarImage size={120} />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className={styles.input}
                />
            </div>

        </div>
    )
}
