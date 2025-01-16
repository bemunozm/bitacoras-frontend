
/*Funcionalidades del Administrador*/

import api from "@/lib/axios"
import { User, UserForm, userSchema, UserUpdateForm } from "@/types"
import { isAxiosError } from "axios"

export async function createUser(formData: UserForm){
    try {
        const url = '/users/create'
        const { data } = await api.post<string>(url, formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getUsers() {
    try {
        const url = '/users/get'
        const { data } = await api.get(url)
        console.log('Usuarios', data)
        const response = userSchema.array().safeParse(data)
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

export async function getUserById(id: User['id']) {
    try {
        const url = `/users/get/${id}`
        const { data } = await api.get<string>(url)
        const response = userSchema.safeParse(data)
        if(response.success) {
            return response.data
        }
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function updateUser(formData: UserUpdateForm) {
    try {
        const url = `/users/update/${formData.id}`
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

export async function deleteUser(id: User['id']) {
    try {
        const url = `/users/delete/${id}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error)
        }
    }
}

export async function getCoordinators() {

    try {
        const url = '/users/coordinators'
        const { data } = await api.get(url)
        const response = userSchema.array().safeParse(data)
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