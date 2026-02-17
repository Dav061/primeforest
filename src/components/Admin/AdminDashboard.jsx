import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminCategories from "./AdminCategories";

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="admin-dashboard">
      <h1>Панель администратора</h1>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleChangeTab}>
          <Tab label="Товары" />
          <Tab label="Заказы" />
          <Tab label="Категории" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {tabValue === 0 && <AdminProducts />}
        {tabValue === 1 && <AdminOrders />}
        {tabValue === 2 && <AdminCategories />}
      </Box>
    </div>
  );
};

export default AdminDashboard;
