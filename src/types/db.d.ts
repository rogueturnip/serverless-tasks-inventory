import type { ColumnType } from "kysely";

export type ConditionEnum = "fair" | "good" | "new" | "poor" | "used";

export type DaysOfWeekType = "Fri" | "Mon" | "Sat" | "Sun" | "Tue" | "Wed'Thu";

export type FrequencyType = "Daily" | "Monthly" | "Weekly" | "Yearly";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Months = "Apr" | "Aug" | "Dec" | "Feb" | "Jan" | "Jul" | "Jun" | "Mar" | "May" | "Nov" | "Oct" | "Sep";

export type Point = {
  x: number;
  y: number;
};

export type TaskActionType = "completed" | "skipped";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface BrandCategory {
  brand_id: string;
  category_id: string;
}

export interface Brands {
  display_name: string;
  id: Generated<string>;
  supported_ecosystem_id: string | null;
}

export interface Buildings {
  id: Generated<string>;
}

export interface BuildingSpaces {
  id: Generated<string>;
  name: string;
}

export interface Categories {
  active: Generated<boolean | null>;
  created_at: Generated<Timestamp>;
  description: string | null;
  externals: Json | null;
  id: string;
  internal: Generated<boolean>;
  label: string;
  modified_at: Timestamp;
  parent_id: string | null;
  slug: string;
}

export interface CategoryImages {
  banner: string | null;
  category_id: string;
  full: string | null;
  teaser: string | null;
}

export interface CategoryTypesAllowed {
  category_id: string;
  communication: Generated<boolean | null>;
  content: Generated<boolean | null>;
  inventory: Generated<boolean | null>;
  task: Generated<boolean | null>;
}

export interface ClimateCounties {
  ba_climate_zone: string | null;
  county_fips: string;
  iecc_climate_zone: number | null;
  iecc_moisture_regime: string | null;
}

export interface Content {
  id: Generated<string>;
}

export interface Counties {
  fips: string;
  label: string | null;
  state_code: string;
}

export interface Countries {
  code: string;
  name: string;
}

export interface DataSources {
  display_name: string;
  type: string;
}

export interface Ecosystems {
  id: string;
}

export interface Inventory {
  brand_id: string | null;
  brand_other: string | null;
  building_id: string;
  condition: ConditionEnum | null;
  created_at: Generated<Timestamp | null>;
  created_by: string;
  current_value: string | null;
  description: string | null;
  display_image: string | null;
  ecosystem_id: string | null;
  expected_life: number | null;
  id: Generated<string>;
  in_report: Generated<boolean | null>;
  manufactured_month: number[] | null;
  manufactured_years: number[] | null;
  model_id: string | null;
  modified_at: Timestamp | null;
  modified_by: string | null;
  purchase_location: string | null;
  purchase_price: string | null;
  purchased_at: Timestamp | null;
  quantity: Generated<number | null>;
  remaining_life: number | null;
  risk_score: string | null;
  serial_number: string | null;
  space_id: string | null;
  title: string;
  warranty_expires_at: Timestamp | null;
}

export interface InventoryByTopLevelCategory {
  building_id: string | null;
  category_id: string | null;
  category_name: string | null;
  description: string | null;
  inventory_id: string | null;
  title: string | null;
}

export interface InventoryCategory {
  category_id: string;
  inventory_id: string;
}

export interface InventoryImages {
  inventory_id: string;
  text: string | null;
  user_image_id: string;
}

export interface ServiceProviderEcosystems {
  service_provider_id: string;
  supported_ecosystem_id: string;
}

export interface ServiceProviders {
  address: string;
  city: string;
  contact_email: string;
  contact_email_domains: Json | null;
  country_code: string | null;
  created_at: Generated<Timestamp>;
  created_by: string;
  display_name: string;
  domains: Json;
  id: Generated<string>;
  location: Point | null;
  modified_at: Timestamp | null;
  modified_by: string | null;
  name: string;
  phone: string;
  source_subscriptions: Json | null;
  state_province_code: string | null;
  status: string;
  support_email: string;
  timezone: string;
  zip_code: string | null;
}

export interface ServiceProviderStatuses {
  description: string | null;
  status: string;
}

export interface ServiceProviderUsers {
  app_user_id: string | null;
  id: string;
  service_provider_id: string | null;
}

export interface Source7Brands {
  brand_name: string;
  id: number;
}

export interface SpaceTypes {
  display_name: string;
  type: string;
}

export interface StatesProvinces {
  code: string;
  country_code: string;
  name: string;
}

export interface SupportedEcosystems {
  connection_type: string;
  display_name: string;
  id: Generated<string>;
  name: string;
  provider_type: string;
}

export interface SystemImages {
  created_at: Generated<Timestamp>;
  created_by: string | null;
  id: Generated<string>;
  service_provider_id: string | null;
  url: string;
}

export interface TaskActions {
  action: TaskActionType;
  action_at: Generated<Timestamp | null>;
  action_by: string;
  id: Generated<string>;
  task_id: string;
}

export interface TaskCategory {
  category_id: string;
  task_id: string;
}

export interface TaskImages {
  task_id: string;
  text: string | null;
  user_image_id: string;
}

export interface Tasks {
  building_id: string;
  by_day_of_week: DaysOfWeekType[] | null;
  by_months: Months[] | null;
  content_reference_id: string | null;
  count: number | null;
  created_at: Generated<Timestamp | null>;
  created_by: string;
  description: string | null;
  display_image: string | null;
  frequency: FrequencyType | null;
  id: Generated<string>;
  interval: number | null;
  modified_at: Timestamp | null;
  modified_by: string | null;
  schedule: string | null;
  start_date: Timestamp | null;
  title: string;
  until_date: Timestamp | null;
}

export interface TasksByTopLevelCategory {
  building_id: string | null;
  category_id: string | null;
  category_name: string | null;
  description: string | null;
  task_id: string | null;
  title: string | null;
}

export interface TimeZones {
  description: string;
  iana_identifier: string;
  utc_offset: string;
}

export interface UserImages {
  building_id: string;
  created_at: Generated<Timestamp>;
  created_by: string;
  id: Generated<string>;
  original_key: string;
  resized_key: string | null;
}

export interface Users {
  id: Generated<string>;
}

export interface DB {
  brand_category: BrandCategory;
  brands: Brands;
  building_spaces: BuildingSpaces;
  buildings: Buildings;
  categories: Categories;
  category_images: CategoryImages;
  category_types_allowed: CategoryTypesAllowed;
  climate_counties: ClimateCounties;
  content: Content;
  counties: Counties;
  countries: Countries;
  data_sources: DataSources;
  ecosystems: Ecosystems;
  inventory: Inventory;
  inventory_by_top_level_category: InventoryByTopLevelCategory;
  inventory_category: InventoryCategory;
  inventory_images: InventoryImages;
  service_provider_ecosystems: ServiceProviderEcosystems;
  service_provider_statuses: ServiceProviderStatuses;
  service_provider_users: ServiceProviderUsers;
  service_providers: ServiceProviders;
  source7_brands: Source7Brands;
  space_types: SpaceTypes;
  states_provinces: StatesProvinces;
  supported_ecosystems: SupportedEcosystems;
  system_images: SystemImages;
  task_actions: TaskActions;
  task_category: TaskCategory;
  task_images: TaskImages;
  tasks: Tasks;
  tasks_by_top_level_category: TasksByTopLevelCategory;
  time_zones: TimeZones;
  user_images: UserImages;
  users: Users;
}
