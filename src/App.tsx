// App.tsx (VOLTA PARA A ESTRUTURA ANTERIOR E MAIS LIMPA)

// ...
          {/* ROTAS ADMIN PROTEGIDAS */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
              {/* ⭐️ ROTA DE CATEGORIAS VOLTA A SER ANINHADA ⭐️ */}
              <Route path="categories" element={<Categories />} />
            </Route>
          </Route>
// ...
