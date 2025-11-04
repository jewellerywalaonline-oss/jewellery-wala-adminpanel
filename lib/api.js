// Mock API functions with simulated delays

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchData(endpoint) {
  await delay(500)

  const {
    mockUsers,
    mockProducts,
    mockOrders,
    mockCategories,
    mockBanners,
    mockTestimonials,
    mockFAQs,
    mockWhyChooseUs,
    mockMaterials,
    mockColors,
    mockStats,
  } = await import("./mock-data")

  const data = {
    users: mockUsers,
    products: mockProducts,
    orders: mockOrders,
    categories: mockCategories,
    banners: mockBanners,
    testimonials: mockTestimonials,
    faqs: mockFAQs,
    whyChooseUs: mockWhyChooseUs,
    materials: mockMaterials,
    colors: mockColors,
    stats: mockStats,
  }

  return data[endpoint] || []
}

export async function createItem(endpoint, item) {
  await delay(300)
  return { ...item, id: Date.now() }
}

export async function updateItem(endpoint, id, updates) {
  await delay(300)
  return { id, ...updates }
}

export async function deleteItem(endpoint, id) {
  await delay(300)
  return { success: true, id }
}

export async function login(email, password) {
  await delay(500)

  if (email === "admin@example.com" && password === "admin123") {
    return {
      success: true,
      token: "mock-jwt-token",
      user: { id: 1, name: "Admin User", email, role: "admin" },
    }
  }

  throw new Error("Invalid credentials")
}

export async function logout() {
  await delay(200)
  return { success: true }
}
