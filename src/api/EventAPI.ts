import api from "@/lib/axios"
import { Event, EventForm, eventSchema, EventUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createEvent(formData: EventForm) {
    try {
        const url = '/events/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getEvents() {
    try {
        const url = '/events/get'
        const { data } = await api.get(url)
        const response = eventSchema.array().safeParse(data)
        console.log(response)
        if(response.success) {
            return response.data
        }

    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getEvent(id: Event['id']) {
    try {
        const url = `/events/get/${id}`
        const { data } = await api.get<string>(url)
        console.log(data)
        const response = eventSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateEvent(formData: EventUpdateForm) {
    try {
        const url = `/events/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteEvent(id: Event['id']) {
    try {
        const url = `/events/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getEventsByParticipant(id: number) {
    try {
        const url = `/events/participant/${id}`
        const { data } = await api.get(url)
        const response = eventSchema.array().safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}