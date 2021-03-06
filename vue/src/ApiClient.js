export default class ApiClient {
  constructor (store, router) {
    this.baseUrl = 'http://localhost:5000'
    this.store = store
    this.router = router
    this.accessToken = window.localStorage.getItem('accessToken')
  }

  async request (url, payload = null) {
    const method = payload ? 'POST' : 'GET'
    console.log(`Request: ${method} ${url}`)
    const options = {
      method: method,
      headers: {}
    }
    if (payload instanceof FormData) {
      options.body = payload
    } else if (payload) {
      options.body = JSON.stringify(payload)
      options.headers['Content-Type'] = 'application/json'
    }
    if (this.accessToken) {
      options.headers.Authorization = `Bearer ${this.accessToken}`
    }
    const request = await fetch(`${this.baseUrl}${url}`, options)
    if (request.status === 401) {
      return this.router.push({ name: 'Login' })
    }
    const response = await request.json()
    if (response.errors) {
      this.store.commit('errors', response.errors)
    }
    return response
  }

  async getLeagueSeasons () {
    return await this.request('/league/getLeagueSeasons')
  }

  async getProject (projectId) {
    const url = '/project/' + projectId
    return await this.request(url)
  }

  async createMaterial (data) {
    return await this.request('/project/material/create', data)
  }

  async getMaterials (projectId) {
    const url = '/project/materials/' + projectId
    const request = await this.request(url)
    if (!request?.materials) {
      return request
    }
    return request.materials
  }

  async updateMaterial (updateId, data) {
    return await this.request('/project/material/update/' + updateId, data)
  }

  async deleteMaterial (materialId) {
    const url = '/project/material/delete/' + materialId
    return await this.request(url)
  }

  async updateLineItem (data) {
    return await this.request('/project/material/line-item/update/', data)
  }

  async duplicateLineItem (id) {
    return await this.request('/project/material/line-item/duplicate/' + id)
  }

  async deleteLineItem (lineItemId) {
    const url = '/project/material/line-item/delete/' + lineItemId
    return await this.request(url)
  }

  async getLineItemsWithMaterials (projectId) {
    const url = '/project/material/line-items/both/' + projectId
    const request = await this.request(url)
    if (!request?.lineItemsWithMaterials) {
      return request
    }
    return request.lineItemsWithMaterials
  }

  async getPublicProjects () {
    const request = await this.request('/projects/public')
    if (!request?.projects) {
      return request
    }
    return request.projects
  }

  async newProject (data) {
    const response = await this.request('/project/create', data)
    if (response.project) {
      this.router.push({ name: 'Design Project', params: { id: response.project.id } })
    }
    return response
  }

  setAccessToken (token) {
    this.accessToken = token
    window.localStorage.setItem('accessToken', token)
  }

  async register (data) {
    const response = await this.request('/user/register', data)
    if (response.user) {
      this.router.push({ name: 'LeagueRegistration', params: { id: response.user.id, sex: response.user.sex, age: response.user.age } })
    }
    return response
  }

  async leagueRegister (data) {
    const response = await this.request('/league/register', data)
    if (response.user) {
      this.router.push({ name: 'InviteFriends', params: { id: response.user } })
    }
    return response
  }

  async addToWaitList (data) {
    const response = await this.request('/referral/addToWaitList/' + data)
    if (response.user) {
      this.router.push({ name: 'WaitList'})
    }
    return response
  }

  async inviteFriendCreate (data) {
    console.log('Reached invite friend api!')
    const response = await this.request('/referral/inviteFriendCreate', data)
    if (response.user) {
      this.router.push({ name: 'SignAndDraft', params: { id: response.user } })
    }
    return response
  }

  async login (data) {
    const response = await this.request('/user/login', data)
    if (response.accessToken) {
      this.setAccessToken(response.accessToken)
      this.router.push({ name: 'Home' })
    }
    return response
  }

  logout () {
    this.setAccessToken('')
    this.router.push({ name: 'LandingPage' })
  }

  isLoggedIn () {
    return !!this.accessToken
  }
}
