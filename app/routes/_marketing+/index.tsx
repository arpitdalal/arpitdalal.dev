import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import ExternalLink from '#app/components/external-link.js'
import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon.js'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<>
			<Background>
				<div className="container flex flex-col items-center justify-between gap-6">
					<h1 className="max-w-[15ch] text-center text-6xl sm:text-8xl">
						<span className="block text-sm uppercase text-foreground/70">
							Hello there, I'm
						</span>
						<span className="flex space-x-5 font-bold">
							<span>
								<span className="text-primary">A</span>
								<span>rpit</span>
							</span>
							<span>
								<span className="text-primary">D</span>
								<span>alal</span>
							</span>
						</span>
					</h1>
					<p className="max-w-[60ch] text-center text-lg sm:text-xl">
						I'm a software engineer and a full-stack developer living in the
						Greater Toronto Area. I have a passion for building web applications
						and have a strong background in front-end development.
					</p>
					<div className="flex gap-5">
						<Button variant="outline" asChild>
							<Link to="contact">Contact me</Link>
						</Button>
						<Button asChild>
							<Link
								to="/resume.pdf"
								download="arpit-dalal-resume.pdf"
								reloadDocument
							>
								<Icon name="download-outline" className="size-4">
									Resume
								</Icon>
							</Link>
						</Button>
					</div>
					<div className="mt-2 flex gap-5">
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							asChild
						>
							<ExternalLink href="https://arpit.im/x" aria-label="Twitter">
								<Icon name="brand-x-outline" className="size-4" />
							</ExternalLink>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							asChild
						>
							<ExternalLink href="https://arpit.im/gh" aria-label="GitHub">
								<Icon name="brand-github-outline" className="size-4" />
							</ExternalLink>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							asChild
						>
							<ExternalLink href="https://arpit.im/yt" aria-label="Youtube">
								<Icon name="brand-youtube-outline" className="size-4" />
							</ExternalLink>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							asChild
						>
							<ExternalLink href="https://arpit.im/in" aria-label="LinkedIn">
								<Icon name="brand-linkedin-outline" className="size-4" />
							</ExternalLink>
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
				className="absolute inset-0 h-full bg-dot-black dark:bg-dot-white"
				style={{
					opacity: 0.3,
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
