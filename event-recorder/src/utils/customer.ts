import prisma from "shared-utils";

export function getDefaultStatusForCustomer(customerID: string) {
  return prisma.userStatus.findFirstOrThrow({
    where: {
      customerID: customerID,
      default: true,
    },
  });
}
