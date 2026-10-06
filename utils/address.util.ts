import divisions from "@/constants/address/divisions.json";
import districts from "@/constants/address/districts.json";
import upazilas from "@/constants/address/upazilas.json";
import unions from "@/constants/address/unions.json";

export const getDivisions = () => {
  return divisions;
};

export const getDistrictsByDivision = (divisionId: string) => {
  if (!divisionId) return [];

  return districts.filter(
    (district) => String(district.division_id) === String(divisionId),
  );
};

export const getUpazilasByDistrict = (districtId: string) => {
  if (!districtId) return [];

  return upazilas.filter(
    (upazila) => String(upazila.district_id) === String(districtId),
  );
};

export const getUnionsByUpazila = (upazilaId: string) => {
  if (!upazilaId) return [];

  return unions.filter(
    (union) => String(union.upazila_id) === String(upazilaId),
  );
};

export const findDivisionByName = (name?: string) => {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return divisions.find(
    (d) => d.name.toLowerCase() === n || d.bn_name === n,
  );
};

export const findDistrictByName = (name?: string, divisionId?: string) => {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return districts.find((d) => {
    const matchesName = d.name.toLowerCase() === n || d.bn_name === n;
    if (!matchesName) return false;
    if (divisionId) return String(d.division_id) === String(divisionId);
    return true;
  });
};

export const findUpazilaByName = (name?: string, districtId?: string) => {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return upazilas.find((u) => {
    const matchesName = u.name.toLowerCase() === n || u.bn_name === n;
    if (!matchesName) return false;
    if (districtId) return String(u.district_id) === String(districtId);
    return true;
  });
};
