import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { AuthRepository } from "./auth.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import config from "../../core/config/index.js";
import { addEmailJob } from "../../core/queue/index.js";

export class AuthService {
  constructor() {
    this.repo = new AuthRepository();
  }

  #generateTokens(user) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    const refreshToken = jwt.sign({ sub: user.id, jti: uuidv4() }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
    return { accessToken, refreshToken };
  }

  async register({ email, password, name }) {
    const existing = await this.repo.findByEmail(email);
    if (existing) throw ApiError.conflict("Email already registered");

    const adminCount = await this.repo.countAdmins();
    const role = adminCount === 0 ? "SUPER_ADMIN" : "CUSTOMER";

    const hash = await bcrypt.hash(password, 12);
    const user = await this.repo.create({ email, password: hash, name, role });

    const tokens = this.#generateTokens(user);
    await this.repo.updateRefreshToken(user.id, tokens.refreshToken);

    await addEmailJob("welcome", { to: email, name });

    return { user: this.#sanitize(user), ...tokens };
  }

  async login({ email, password }) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw ApiError.unauthorized("Invalid credentials");
    if (!user.isActive) throw ApiError.unauthorized("Account deactivated");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw ApiError.unauthorized("Invalid credentials");

    const tokens = this.#generateTokens(user);
    await this.repo.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.#sanitize(user), ...tokens };
  }

  async refreshToken(token) {
    let payload;
    try {
      payload = jwt.verify(token, config.jwt.refreshSecret);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const user = await this.repo.findById(payload.sub);
    if (!user || user.refreshToken !== token)
      throw ApiError.unauthorized("Refresh token revoked");

    const tokens = this.#generateTokens(user);
    await this.repo.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId) {
    await this.repo.updateRefreshToken(userId, null);
  }

  async me(userId) {
    const user = await this.repo.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return this.#sanitize(user);
  }

  #sanitize(user) {
    const { password: _password, refreshToken: _refreshToken, ...safe } = user;
    return safe;
  }
}
