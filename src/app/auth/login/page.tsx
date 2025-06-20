import { LoginForm } from "./_components/LoginForm"

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-bold">ログイン</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Yuhaku POSシステムにログイン
					</p>
				</div>
				<LoginForm />
			</div>
		</div>
	)
}