import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { loadEnv } from '../config/env.js'
import * as schema from './schema.js'

const { databaseUrl } = loadEnv()

const pool = mysql.createPool(databaseUrl)

export const db = drizzle(pool, { schema, mode: 'default' })
