describe('env', () => {
  it('should have a client id', () => {
    expect(process.env.SENDGRID_API_KEY).toBeDefined()
  })
  it('should have a client secret', () => {
    expect(process.env.PORT).toBeDefined()
  })
  it('should have a host', () => {
    expect(process.env.JWT_SECRET).toBeDefined()
  })
  it('should have a scope', () => {
    expect(process.env.MONGODB_URL).toBeDefined()
  })
})
