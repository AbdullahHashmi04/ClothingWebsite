import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export default function setUser(user) {
  try {
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.Username,
      },
      SECRET_KEY,
      { expiresIn: "2h" }
    );
    return token;
  } catch (err) {
    console.error("JWT generation error:", err);
    return null;
  }
}


// Decode/Verify JWT token
export const getUser = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error("JWT verification error:", err);
    return null;
  }
};
