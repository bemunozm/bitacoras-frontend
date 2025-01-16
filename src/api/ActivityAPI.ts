import api from "@/lib/axios"
import { ActivityForm, activitySchema, ActivityUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createActivity(formData: ActivityForm) {
    try {
        const url = '/activities/create'
        const { data } = await api.post<string>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getActivities() {
    try {
        const url = '/activities/get'
        const { data } = await api.get(url)
        const response = activitySchema.array().safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getActivity(id: number) {
    try {
        const url = `/activities/get/${id}`
        const { data } = await api.get<string>(url)
        const response = activitySchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateActivity(formData: ActivityUpdateForm) {
    try {
        const url = `/activities/update/${formData.id}`
        const { data } = await api.put<string>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteActivity(id: number) {
    try {
        const url = `/activities/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getActivitiesByBitacoraId(id: number) {
    try {
        const url = `/activities/bitacora/${id}`
        const { data } = await api.get(url)
        const response = activitySchema.array().safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}