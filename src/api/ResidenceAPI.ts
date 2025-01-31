import api from "@/lib/axios"
import { Residence, ResidenceForm, residenceSchema, ResidenceUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createResidence(formData: ResidenceForm) {
    try {
        const url = '/residences/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getResidences() {
    try {
        const url = '/residences/get'
        const { data } = await api.get(url)
        return data

    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getResidence(id: Residence['id']) {
    try {
        const url = `/residences/get/${id}`
        const { data } = await api.get<string>(url)
        console.log(data)
        const response = residenceSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateResidence(formData: ResidenceUpdateForm) {
    try {
        const url = `/residences/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteResidence(id: Residence['id']) {
    try {
        const url = `/residences/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function participantEntrance(formData: any) {
    try {
        const url = '/residences/participant-entrance'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function participantDeparture(formData: any) {
    try {
        const url = '/residences/participant-departure'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getActiveParticipants() {
    try {
        const url = '/residences/active-participants'
        const { data } = await api.get(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getParticipantsByResidence(id: Residence['id']) {
    try {
        const url = `/residences/get-participants/${id}`
        const { data } = await api.get(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}