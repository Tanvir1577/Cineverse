// Dynamic year utility
export const getCurrentYear = () => {
  return new Date().getFullYear().toString()
}

export const getCopyrightText = () => {
  const year = getCurrentYear()
  return `© ${year} Cineverse. Premium Movie Streaming & Downloads`
}
