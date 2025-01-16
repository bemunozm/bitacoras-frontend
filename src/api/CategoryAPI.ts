import api from "@/lib/axios"
import { Category, CategoryForm, categorySchema, CategoryUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createCategory(formData: CategoryForm) {
    try {
        const url = '/categories/create'
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getCategories() {
    try {
        const url = '/categories/get'
        const { data } = await api.get(url)
        const response = categorySchema.array().safeParse(data)
        if(response.success) {
            return response.data
        }

    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getCategory(id: Category['id']) {
    try {
        const url = `/categories/get/${id}`
        const { data } = await api.get<string>(url)
        console.log(data)
        const response = categorySchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateCategory(formData: CategoryUpdateForm) {
    try {
        const url = `/categories/update/${formData.id}`
        const { data } = await api.put<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function deleteCategory(id: Category['id']) {
    try {
        const url = `/categories/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}