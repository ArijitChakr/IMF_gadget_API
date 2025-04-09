import { RequestHandler, Router } from "express";
import { Status } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../middlewares/authmiddleware";
import prisma from "../db";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const getRandomSuccessProbability = (): string =>
  `${Math.floor(Math.random() * 101)}%`;

const generateCodename = (): string => {
  const codenames = [
    "The Nightingale",
    "The Kraken",
    "The Falcon",
    "The Shadow",
  ];
  const uniqueSuffix = uuidv4().split("-")[0].toUpperCase();
  const randomName = codenames[Math.floor(Math.random() * codenames.length)];

  return `${randomName}-  ${uniqueSuffix}`;
};

router.use(authMiddleware as RequestHandler);

/**
 * @swagger
 * /gadgets:
 *   get:
 *     summary: Retrieve all gadgets with a "mission success probability rate" for each
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Deployed, Destroyed, Decommissioned]
 *         required: false
 *         description: Filter gadgets by their status
 *     responses:
 *       200:
 *         description: A list of gadgets
 *       401:
 *         description: Invalid token
 */

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const { status } = req.query;
    const whereClause = status ? { status: status as Status } : {};

    const gadgets = await prisma.gadget.findMany({ where: whereClause });
    const results = gadgets.map((gadget) => ({
      id: gadget.id,
      name: gadget.name,
      codename: gadget.codename,
      status: gadget.status,
      decommissionedAt: gadget.decommissionedAt,
      missionSuccessProbability: getRandomSuccessProbability(),
    }));

    res.json(results);
  })
);

/**
 * @swagger
 * /gadgets:
 *   post:
 *     summary: Create a new gadget
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Available, Deployed, Destroyed, Decommissioned]
 *     responses:
 *       201:
 *         description: Gadget created successfully
 *       401:
 *         description: Invalid token
 */

router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    const { name, status } = req.body;
    const codename = generateCodename();
    const newGadget = await prisma.gadget.create({
      data: {
        name,
        codename,
        status: status || Status.Available,
      },
    });
    res.status(201).json(newGadget);
  })
);

/**
 * @swagger
 * /gadgets/{id}:
 *   patch:
 *     summary: Update gadget details
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the gadget to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Available, Deployed, Destroyed, Decommissioned]
 *     responses:
 *       200:
 *         description: Gadget updated successfully
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Gadget not found
 */

router.patch(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updatedData = req.body;

    const gadget = await prisma.gadget.findUnique({ where: { id } });
    if (!gadget) {
      return res.status(404).json({ error: "Gadget not found." });
    }

    const updatedGadget = await prisma.gadget.update({
      where: { id },
      data: updatedData,
    });
    res.json(updatedGadget);
  })
);

/**
 * @swagger
 * /gadgets/{id}:
 *   delete:
 *     summary: Soft-delete a gadget by marking it as "Decommissioned"
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the gadget to decommission
 *     responses:
 *       200:
 *         description: Gadget decommissioned
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Gadget not found
 */

router.delete(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const gadget = await prisma.gadget.findUnique({ where: { id } });
    if (!gadget) {
      return res.status(404).json({ error: "Gadget not found." });
    }

    const decommissionedGadget = await prisma.gadget.update({
      where: { id },
      data: {
        status: Status.Decommissioned,
        decommissionedAt: new Date(),
      },
    });

    res.json({
      message: "Gadget decommissioned.",
      gadget: decommissionedGadget,
    });
  })
);

/**
 * @swagger
 * /gadgets/{id}/self-destruct:
 *   post:
 *     summary: Trigger the self-destruct sequence for a specific gadget
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the gadget to self-destruct
 *     responses:
 *       200:
 *         description: Self-destruct sequence initiated
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Gadget not found
 */

router.post(
  "/:id/self-destruct",
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const gadget = await prisma.gadget.findUnique({ where: { id } });
    if (!gadget) {
      return res.status(404).json({ error: "Gadget not found." });
    }

    const confirmationCode = uuidv4().split("-")[0].toUpperCase();

    const updatedGadget = await prisma.gadget.update({
      where: { id },
      data: { status: Status.Destroyed },
    });

    res.json({
      message: `Self-destruct sequence initiated for gadget ${updatedGadget.name}.`,
      confirmationCode,
    });
  })
);

export default router;
