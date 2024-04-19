import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import BlogLink from '#app/components/blog-link.js'
import { Button } from '#app/components/ui/button.js'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<>
			<Background>
				<div className="container flex flex-col items-center justify-between gap-6">
					<h1 className="max-w-[15ch] text-center text-5xl md:text-8xl">
						Hello World
					</h1>
					<div className="flex gap-5">
						<Button variant="ghost" asChild>
							<Link to="contact">Contact me</Link>
						</Button>
						<Button asChild>
							<BlogLink className="" />
						</Button>
					</div>
				</div>
			</Background>
			<div className="container">
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe culpa
					quis autem? Eius ratione hic ex officia eligendi inventore recusandae
					nisi. Provident libero obcaecati nisi necessitatibus itaque quidem
					assumenda molestiae!
				</p>
			</div>
		</>
	)
}

function Background({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative flex w-full items-center justify-center py-20">
			<div
				aria-hidden
				className="bg-dot-black dark:bg-dot-white absolute inset-0 h-full"
				style={{
					opacity: 0.4,
				}}
			></div>
			{/* Radial gradient for the container to give a faded look */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
			></div>
			<div className="relative z-10">
				<>{children}</>
			</div>
		</div>
	)
}
