import os

folder_path = r"D:/D-Documents/Code_VCN/Photobooth/my-app/public/images/stickers/Jewery"   # sửa lại đường dẫn của bạn

files = os.listdir(folder_path)

# Lọc chỉ lấy file (không lấy folder)
files = [f for f in files if os.path.isfile(os.path.join(folder_path, f))]

# Sắp xếp để thứ tự ổn định
files.sort()

for index, filename in enumerate(files, start=1):
    old_path = os.path.join(folder_path, filename)
    new_filename = f"st-{index}.png"
    new_path = os.path.join(folder_path, new_filename)

    os.rename(old_path, new_path)
    print(f"Đổi: {filename} -> {new_filename}")

print("Hoàn tất!")
