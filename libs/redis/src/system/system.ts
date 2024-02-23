export interface SystemHeartbeat {
  lockSecret?: string
  repeatableJobId?: string
}

export interface SystemStatus {
  isRunning: boolean
}
