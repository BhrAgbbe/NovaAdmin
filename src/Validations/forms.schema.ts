import * as yup from "yup";
import type { Messages } from "@/Dictionary/messages";
import { isImageUrl, isLocalImage, normalizeDigits, normalizePriceInput } from "@/Utils/format";

export function createLoginSchema(m: Messages) {
  return yup.object({
    username: yup.string().trim().required(m.required),
    password: yup.string().required(m.required),
  });
}

export function parsePrice(value: string) {
  const normalized = normalizePriceInput(value);
  return /^\d*\.?\d+$/.test(normalized) ? Number(normalized) : NaN;
}

export function createProductSchema(m: Messages) {
  return yup.object({
    title: yup.string().trim().required(m.required),
    description: yup.string().trim().required(m.required),
    price: yup
      .string()
      .required(m.required)
      .test("price", m.invalidPrice, (value) => {
        const price = parsePrice(value ?? "");
        return Number.isFinite(price) && price > 0;
      }),
    category: yup.string().required(m.required),
    image: yup
      .string()
      .trim()
      .required(m.required)
      .test("image", m.invalidImage, (value) => !value || isImageUrl(value) || isLocalImage(value)),
  });
}

export function createUserSchema(m: Messages, editing = false) {
  return yup.object({
    firstName: yup.string().trim().required(m.required),
    lastName: yup.string().trim().required(m.required),
    username: yup.string().trim().required(m.required),
    email: yup.string().trim().email(m.invalidEmail).required(m.required),
    phone: yup
      .string()
      .required(m.required)
      .test(
        "phone",
        m.invalidPhone,
        (value) => !value || /^\+?[0-9][0-9 ()-]{5,23}$/.test(normalizeDigits(value.trim()))
      ),
    password: editing ? yup.string().default("") : yup.string().required(m.required),
  });
}
