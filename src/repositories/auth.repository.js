const server = import.meta.env.VITE_URL_API
const origin = import.meta.env.VITE_ORIGIN_URL

export default class AuthRepository {
  async login(email, password) {
    const body = JSON.stringify({ email: email, password: password })
    const response = await fetch(server + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    })
    if (!response.ok) {
      throw `Error ${response.status} de la BBDD: ${response.statusText}`
    }
    return await response.json()
  }

  async loginWithGoogle() {
    const width = 500
    const height = 600
    const left = screen.width / 2 - width / 2
    const top = screen.height / 2 - height / 2

     window.open(
      server + '/login/google',
      'Iniciar sesión con Google',
      `width=${width},height=${height},top=${top},left=${left}`
    )

    return new Promise((resolve) => {
      window.addEventListener('message', (event) => {
        if (event.origin !== origin) return
        resolve(event.data)
      })
    })
  }
}
