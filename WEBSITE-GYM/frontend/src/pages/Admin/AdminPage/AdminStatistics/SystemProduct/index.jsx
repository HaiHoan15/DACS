function SectionTitle({ index, title, subtitle }) {
	return (
		<div className="mb-5 flex items-end justify-between gap-3">
			<div>
				<h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
					<span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-red-500 text-sm">
						{index}
					</span>
					{title}
				</h2>
				{subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
			</div>
		</div>
	);
}

function Panel({ title, children }) {
	return (
		<div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg">
			<h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
			{children}
		</div>
	);
}

function formatCurrency(value) {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(Number(value) || 0);
}

export default function SystemProduct({ topSellingProducts = [], revenueByProduct = [] }) {
	return (
		<section className="mb-10">
			<SectionTitle index="7" title="Sản Phẩm" subtitle="Top bán chạy và doanh thu theo sản phẩm" />
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
				<Panel title="Top 10 sản phẩm bán chạy">
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-slate-100">
							<thead>
								<tr className="border-b border-slate-600">
									<th className="text-left p-2">Sản phẩm</th>
									<th className="text-right p-2">Số lượng</th>
									<th className="text-right p-2">Đơn</th>
								</tr>
							</thead>
							<tbody>
								{(Array.isArray(topSellingProducts) ? topSellingProducts : []).map((product) => (
									<tr key={product.id} className="border-b border-slate-700 hover:bg-slate-700/40">
										<td className="p-2">{product.product_name}</td>
										<td className="p-2 text-right font-semibold">{product.total_quantity}</td>
										<td className="p-2 text-right">{product.order_count}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Panel>

				<Panel title="Doanh thu theo sản phẩm">
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-slate-100">
							<thead>
								<tr className="border-b border-slate-600">
									<th className="text-left p-2">Sản phẩm</th>
									<th className="text-right p-2">Doanh thu</th>
									<th className="text-right p-2">Số lượng</th>
								</tr>
							</thead>
							<tbody>
								{(Array.isArray(revenueByProduct) ? revenueByProduct : []).map((product) => (
									<tr key={product.id} className="border-b border-slate-700 hover:bg-slate-700/40">
										<td className="p-2">{product.product_name}</td>
										<td className="p-2 text-right font-semibold">{formatCurrency(product.total_revenue)}</td>
										<td className="p-2 text-right">{product.total_quantity}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Panel>
			</div>
		</section>
	);
}
