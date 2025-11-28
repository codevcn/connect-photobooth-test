Dưới đây là bản phân tích **rõ ràng – đầy đủ – có hệ thống** cho API bạn cung cấp, theo đúng logic bạn yêu cầu ở catalog mới. Tôi trình bày theo từng nhóm để bạn dễ implement vào frontend (React / Next.js / NodeJS), rất phù hợp cho case thương mại điện tử nhiều biến thể.

---

# 1. Quy tắc lọc & sắp xếp sản phẩm

### **1.1. Chỉ hiển thị sản phẩm có status = "active"**

- Nếu `status != "active"` → bỏ qua hoàn toàn sản phẩm đó.
- Trong API của bạn: `"status": "active"` → hợp lệ.

### **1.2. Thứ tự hiển thị sản phẩm**

- Sắp xếp danh sách sản phẩm theo **slug (ASC)**.

---

# 2. Mô tả cấu trúc sản phẩm

Sản phẩm có:

- Thông tin chung: id, name, slug, description, ảnh base…
- Danh sách **surfaces**: các mặt mockup của sản phẩm (áo mặt trước, sau, ốp điện thoại…).
- Danh sách **variants**: mỗi variant chính là một tổ hợp thuộc tính.

Variant có:

- sku
- giá
- `attributes_json` — chứa toàn bộ thuộc tính → **đây là trọng tâm catalog mới**
- `variant_surfaces` — mỗi variant có mockup riêng cho từng surface → **để đổi mockup + transform_json**

---

# 3. Catalog mới — Thuộc tính được chuẩn hoá hoàn toàn

`.attributes_json` có thể chứa các cột:

```
color,
colorTitle,
hex,
size,
sizeTitle,
material,
materialTitle,
scent,
scentTitle
```

- **Null thì không hiển thị**.
- Các title nếu null → dùng label mặc định ("Chất liệu", "Mùi hương", ...).

---

# 4. Merge các thuộc tính thành cấu trúc hierarchical

Bạn nhận dữ liệu variant như:

| color | size |
| ----- | ---- |
| vàng  | X    |
| vàng  | L    |
| vàng  | M    |
| xanh  | X    |
| xanh  | L    |

Sau khi merge:

```
[
  { color: "vàng", sizes: ["X", "L", "M"] },
  { color: "xanh", sizes: ["X", "L"] }
]
```

### **4.1. Độ ưu tiên merge**

1. material
2. scent
3. color
4. size

=> Tức là group theo thứ tự đó:

```
material
    scent
        color
            size
```

Công thức group sạch nhất:

```
groupBy(material → scent → color → size)
```

---

# 5. Quy tắc hiển thị từng thuộc tính

### **5.1. Color**

Có 3 trường hợp:

#### **Case 1:** color != null AND hex != null

→ Hiển thị như một swatch màu:

```
label = color
color = hex (vd: #000000)
```

#### **Case 2:** color != null AND hex == null

→ Không có hex -> hiển thị text:

```
label = color
color = text only
```

#### **Case 3:** color == null

→ Không hiển thị color (kể cả hex có giá trị).

---

### **5.2. Size, material, scent**

- Thuộc tính null → không hiển thị.
- Không null → hiển thị đúng section riêng.

---

# 6. Thứ tự hiển thị trên UI

**Luôn đúng thứ tự sau:**

1. Material (Chất liệu)
2. Scent (Mùi hương)
3. Color (Màu sắc)
4. Size (Kích thước)

### **Nếu có Title: dùng Title**

Ví dụ:

- `colorTitle = "Màu nè"` → section title = "Màu nè"
- `colorTitle = null` → section title = "Màu sắc"

Áp dụng cho tất cả:
`sizeTitle, materialTitle, scentTitle`.

---

# 7. Logic đổi mockup theo variant

Code cũ:

- Khi chọn thuộc tính → đổi mockup (ảnh preview) của mặt tương ứng.

API mới:

- Khi chọn variant → đổi mockup **và** đổi luôn vùng in dựa vào `transform_json`.

### **Surface có cấu trúc:**

```
surface_id → preview_image → print_areas
```

### **Variant có cấu trúc:**

```
variant_surfaces = [
  {
    surface_id,
    mockup_url,
    transform_json: {
        x_px,
        y_px,
        scale,
        width_px,
        height_px,
        width_real_px,
        height_real_px
    }
  }
]
```

=> Khi chọn 1 variant:

- Lấy đúng `surface_id` trùng với surface đang hiển thị.
- Dùng `mockup_url` làm ảnh mockup.
- Dùng `transform_json` để định nghĩa lại vùng in.

---

# 8. Tóm tắt luồng xử lý chuẩn dành cho frontend

### **Bước 1**: Lọc sản phẩm

Chỉ lấy sản phẩm status = "active".

### **Bước 2**: Sắp xếp theo slug.

### **Bước 3**: Lấy tất cả variants → build tree thuộc tính theo thứ tự:

```
material → scent → color → size
```

### **Bước 4**: Tạo UI attribute selector:

- Section Material (title hoặc fallback "Chất liệu")
- Section Scent (title hoặc fallback "Mùi hương")
- Section Color (swatch hoặc text)
- Section Size (nút)

### **Bước 5**: Khi người dùng chọn đủ thuộc tính → tìm đúng variant.

### **Bước 6**: Khi variant thay đổi:

- Đổi mockup (variant_surfaces[].mockup_url)
- Đổi vùng in (variant_surfaces[].transform_json)
- Đổi giá nếu cần.
