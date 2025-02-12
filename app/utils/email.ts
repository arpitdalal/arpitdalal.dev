import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: process.env.NODEMAILER_HOST,
	port: 465,
	secure: true,
	auth: {
		user: process.env.NODEMAILER_USER,
		pass: process.env.NODEMAILER_PASSWORD,
	},
})

export function sendEmail({
	subject,
	message,
}: {
	subject: string
	message: string
}) {
	return transporter.sendMail({
		from: process.env.NODEMAILER_USER,
		to: process.env.NODEMAILER_USER,
		subject,
		text: message,
	})
}
