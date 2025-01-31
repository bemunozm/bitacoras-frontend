import api from "@/lib/axios"
import { ProvisionCategory, ProvisionCategoryForm, provisionCategorySchema, ProvisionCategoryUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createProvisionCategory(formData: ProvisionCategoryForm) {
    try {
        const url = '/provision-categories/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getProvisionCategories() {
    try {
        const url = '/provision-categories/get'
        const { data } = await api.get(url)
        const response = provisionCategorySchema.array().safeParse(data)
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

export async function getProvisionCategory(id: ProvisionCategory['id']) {
    try {
        const url = `/provision-categories/get/${id}`
        const { data } = await api.get<string>(url)
        console.log(data)
        const response = provisionCategorySchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateProvisionCategory(formData: ProvisionCategoryUpdateForm) {
    try {
        const url = `/provision-categories/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteProvisionCategory(id: ProvisionCategory['id']) {
    try {
        const url = `/provision-categories/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

