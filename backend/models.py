from pydantic import BaseModel, Field
from typing import Optional, List

class ProjectCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    specifications: Optional[str] = ""
    featured: Optional[int] = 0
    price_range: Optional[str] = ""

class ProjectPriceUpdate(BaseModel):
    price_range: str

class ProjectResponse(BaseModel):
    id: int
    title: str
    category: str
    description: Optional[str] = ""
    image_url: str
    specifications: Optional[str] = ""
    featured: int = 0
    price_range: Optional[str] = ""
    created_at: str

class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=8)
    service: Optional[str] = "General Inquiry"
    message: Optional[str] = ""
    address: Optional[str] = ""

class InquiryResponse(BaseModel):
    id: int
    name: str
    phone: str
    service: Optional[str]
    message: Optional[str]
    address: Optional[str]
    status: str
    created_at: str

class InquiryStatusUpdate(BaseModel):
    status: str

class AdminLogin(BaseModel):
    pin: str

class SettingsUpdate(BaseModel):
    business_name: Optional[str] = None
    owner_name: Optional[str] = None
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    working_hours: Optional[str] = None
    admin_pin: Optional[str] = None
