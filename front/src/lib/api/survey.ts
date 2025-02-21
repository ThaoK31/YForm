import { API_URL } from "@/lib/constants"
import { ApiResponse, SurveyResponse, RawSurveyResponse, UserResponse } from "@/lib/types/api"
import { CreateSurveyData, UpdateSurveyData } from "@/lib/types/survey"
import Cookies from 'js-cookie'

async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const responseData = await response.json()
  
  if (!response.ok) {
    const errorMessage = typeof responseData === 'string' 
      ? responseData 
      : responseData.error || responseData.message || "Une erreur est survenue"
    
    return { 
      error: errorMessage,
      status: response.status 
    }
  }

  return { data: responseData, status: response.status }
}

export async function createSurvey(data: CreateSurveyData): Promise<ApiResponse<SurveyResponse>> {
  const token = Cookies.get('token')
  if (!token) {
    throw new Error("Non authentifié")
  }

  const response = await fetch(`${API_URL}/api/surveys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    credentials: 'include',
      body: JSON.stringify(data),
    })

  return handleApiResponse<SurveyResponse>(response)
}

export async function getUserSurveys(): Promise<ApiResponse<SurveyResponse[]>> {
  const token = Cookies.get('token')
  if (!token) {
    throw new Error("Non authentifié")
  }

  const response = await fetch(`${API_URL}/api/surveys/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    credentials: 'include',
    })

  return handleApiResponse<SurveyResponse[]>(response)
}

export async function getSurveyById(id: string): Promise<ApiResponse<SurveyResponse>> {
  if (!id) {
    return {
      error: 'ID du sondage invalide',
      status: 400
    };
  }

  const response = await fetch(`${API_URL}/api/surveys/${id}`, {
    credentials: 'include',
    })

  return handleApiResponse<SurveyResponse>(response)
    }

export async function updateSurvey(id: string, data: UpdateSurveyData): Promise<ApiResponse<SurveyResponse>> {
  const token = Cookies.get('token')
  if (!token) {
    throw new Error("Non authentifié")
  }

  const response = await fetch(`${API_URL}/api/surveys/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    credentials: 'include',
      body: JSON.stringify(data),
    })

  return handleApiResponse<SurveyResponse>(response)
}

export async function deleteSurvey(id: string): Promise<ApiResponse<{ message: string }>> {
  const token = Cookies.get('token')
  if (!token) {
    throw new Error("Non authentifié")
  }

  const response = await fetch(`${API_URL}/api/surveys/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    credentials: 'include',
    })

  return handleApiResponse<{ message: string }>(response)
    }

export async function getSurveyResponseCount(survey_id: string): Promise<ApiResponse<number>> {
  const token = Cookies.get('token')
  if (!token) {
    throw new Error("Non authentifié")
  }

  const response = await fetch(`${API_URL}/api/surveys/${survey_id}/responses/count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    credentials: 'include',
    })

  const result = await handleApiResponse<{ count: number }>(response)
  return {
    ...result,
    data: result.data?.count
  }
}
