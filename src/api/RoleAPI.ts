import api from "@/lib/axios"
import { Role, RoleForm, roleSchema, RoleUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createRole(formData: RoleForm) {
    try {
        const url = '/roles/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getRoles() {
    try {
        const url = '/roles/get'
        const { data } = await api.get(url)
        const response = roleSchema.array().safeParse(data)
        if(response.success) {
            return response.data
        }

    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getRole(id: Role['id']) {
    try {
        const url = `/roles/get/${id}`
        const { data } = await api.get<string>(url)
        
        const response = roleSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateRole(formData: RoleUpdateForm) {
    try {
        const url = `/roles/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteRole(id: Role['id']) {
    try {
        const url = `/roles/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}