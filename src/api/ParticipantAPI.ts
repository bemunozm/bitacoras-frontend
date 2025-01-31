import api from "@/lib/axios"
import { Participant, ParticipantForm, participantSchema, ParticipantUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createParticipant(formData: ParticipantForm) {
    try {
        const url = '/participants/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getParticipants() {
    try {
        const url = '/participants/get'
        const { data } = await api.get(url)
        const response = participantSchema.array().safeParse(data)
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

export async function getParticipant(id: Participant['id']) {
    try {
        const url = `/participants/get/${id}`
        const { data } = await api.get(url)
        const response = participantSchema.safeParse(data)
        console.log(response)
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getPopulatedParticipant(id: Participant['id']) {
    try {
        const url = `/participants/get/${id}/populated`
        const { data } = await api.get(url)
        const response = participantSchema.safeParse(data)
        console.log(response)
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateParticipant(formData: ParticipantUpdateForm) {
    try {
        const url = `/participants/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteParticipant(id: Participant['id']) {
    try {
        const url = `/participants/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getDiseasesByParticipant(id: Participant['id']){
    try {
        const url = `/participants/get/${id}/diseases`
        const { data } = await api.get(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deliverBenefits(formData: { participant_id: Participant['id'], benefits: string[], date: string, turn: string }) {
    try {
        const url = `/participants/deliver-benefits`
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteDeliveredBenefits(benefits: string[]) {
    try {
        const url = `/participants/remove-delivered-benefits`
        const { data } = await api.delete<string>(url, { data: benefits })
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateDeliveredBenefits(id: number, formData: { date: string, turn: string, benefits: string[] }) {
    try {
        const url = `/participants/update-delivered-benefits/${id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getParticipantResidences(id: Participant['id']) {
    try {
        const url = `/participants/get-residences/${id}`
        const { data } = await api.get(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}